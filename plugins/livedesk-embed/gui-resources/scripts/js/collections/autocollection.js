define(['gizmo/superdesk'], function(Gizmo) {
	/*!
	 * Extended collection which is autoupdateing itself
	 */	
	return Gizmo.Collection.extend
	({
		_timeInterval: 10000,
		_idInterval: 0,
		_stats: { limit: 15, offset: 0, lastCId: 0, fistOrder: Infinity, total: 0 },
		/*!
		 * for auto refresh
		 */
		keep: false,
		init: function(){ 
			var self = this;
			self.model.on('publish reorder', function(evt, post){
				if((self._stats.lastCId + 1) === parseInt(post.get('CId')))
					self._stats.lastCId++;
			});
			self.on('readauto', function(evt, data, attr){
				// set offset to limit
				self._stats.offset = self._stats.limit;
				// set total from the attributes 
				self._stats.total = parseInt(attr.total);
				attr.lastCId = parseInt(attr.lastCId);
				if(attr.lastCId > self._stats.lastCId)
					self._stats.lastCId = attr.lastCId;
			}).on('readauto updatesauto addingsauto removeingsauto update',function(evt, data)
			{
				self.getLastCid(data);
				self.getFirstOrder(data);
			}).on('addingsauto', function(evt, data){
				/*!
				 * If addings ( from getting the auto updates ) 
				 *   receive we need to increase the total count of the posts and the offset
				 *   with the numbers of posts added
				 */
				self._stats.total += data.length;
				self._stats.offset += data.length;

			}).on('removeingsauto', function(evt, data){
				/*!
				 * If removeings from the collection ( from getting the autou pdates ) 
				 *   receive we need to decrease the total and the offset for the next page
				 *   with the numbers of posts added
				 */					
				self._stats.total -= data.length;
				self._stats.offset -= data.length;

			}).on('addings', function(evt, data){
				/*!
				 * If addings ( from getting the next page ) 
				 *   receive we need to increase the offset for the next page
				 *   with the numbers of posts added
				 */
				self._stats.offset += data.length;
			});
		},			
		destroy: function(){ this.stop(); },
		auto: function(fn)
		{
			var self = this;
			ret = this.stop().start();
			this._idInterval = setInterval(function(){self.start();}, this._timeInterval);
			return ret;
		},
		start: function()
		{
			var self = this, requestOptions = {data: {'cId.since': this._stats.lastCId, 'order.start': this._stats.fistOrder }, headers:  { 'X-Filter': self._xfilter, 'X-Format-DateTime': 'M/dd/yyyy HH:mm:ss'}};
			if(self._stats.lastCId === 0) delete requestOptions.data;
			if(!this.keep && self.view && !self.view.checkElement()) 
			{
				self.stop();
				return;
			}				
			this.triggerHandler('beforeUpdate');
			return this.autosync(requestOptions);
		},
		stop: function()
		{
			var self = this;
			clearInterval(self._idInterval);
			return this;
		},
		/*!
		 * Get the minim Order value from the post list received.
		 */
		getFirstOrder: function(data)
		{
			for(var i=0, Order, count=data.length; i<count; i++) {
				Order = parseFloat(data[i].get('Order'))
				if( !isNaN(Order) && (this._stats.fistOrder > Order) )
					this._stats.fistOrder = Order;
			}
		},
		/*!
		 * Get the maximum CId value from the post list received.
		 */			
		getLastCid: function(data)
		{
			for(var i=0, CId, count=data.length; i<count; i++) {
				var CId = parseInt(data[i].get('CId'))
				if( !isNaN(CId) && (this._stats.lastCId < CId) )
					this._stats.lastCId = CId;
			}
		},
        autosync: function()
        {
        var self = this;
        return (this.href &&
            this.syncAdapter.request.call(this.syncAdapter, this.href).read(arguments[0]).done(function(data)
            {					
                var attr = self.parseAttributes(data), list = self._parse(data), changeset = [], removeings = [], updates = [], addings = [], count = self._list.length; 
                // important or it will infiloop
                for( var i=0; i < list.length; i++ )
                {
                    var model = false;
                    for( var j=0; j<count; j++ ) {
						if( list[i].hash() == self._list[j].hash() )
                        {
							model = list[i];
                            break;
                        }
					}
                    if( !model ) {
                        if( !list[i].isDeleted() ) {
							self._list.push(list[i]);
							changeset.push(list[i]);
                            if( self.hasEvent('addingsauto') ) {
                                addings.push(list[i]);
                            }
						} else {
                            if( self.hasEvent('updatesauto') ) {
							    updates.push(list[i]);
                            }					
						}
                    }
                    else {
                        if( self.hasEvent('updatesauto') ) {
                            updates.push(model);
                        }
                        if(self.isCollectionDeleted(model)) {
                            self._list.splice(i,1);
                            if( self.hasEvent('removeingsauto') ) {
                                removeings.push(model);
                            }

                        }
                        if( model.isDeleted()) {
                            model._remove();                               
                        } else if( model.isChanged() ){
							changeset.push(model);
						}
                        else {
                            model.on('delete', function(){ self.remove(this.hash()); })
                                    .on('garbage', function(){ this.desynced = true; });
                        }
                    }
                }
                self.desynced = false;
				/**
				 * If the initial data is empty then trigger READ event
				 * else UPDATE with the changeset if there are some
				 */
				if( ( count === 0) ){
					//console.log('read');

					self.triggerHandler('readauto',[self._list,attr]);
                } else {                    
                    /**
                     * Trigger handler with changeset extraparameter as a vector of vectors,
                     * caz jquery will send extraparameters as arguments when calling handler
                     */
                    if( updates.length && self.hasEvent('updatesauto') ) {
                        self.triggerHandler('updatesauto', [updates,attr]);
                    }
                    if( addings.length && self.hasEvent('addingsauto') ) {
                        self.triggerHandler('addingsauto', [addings,attr]);
                    }
                    if( removeings.length && self.hasEvent('removeingsauto') ) {
                        self.triggerHandler('removeingsauto', [removeings,attr]);
                    }
					self.triggerHandler('updateauto', [changeset,attr]);
				}
            }));
        }
	},{ register: 'AutoCollection' });
});