define(['backbone', 'tmpl!superdesk-desk>list-task-comment'], function(Backbone) {
    return Backbone.View.extend({
        tagName: 'li',

        events: {
            'click [data-action="delete"]': 'destroy',
        },

        render: function() {
            $(this.el).tmpl('superdesk-desk>list-task-comment', this.model.getView());
            return this;
        },

        destroy: function(e) {
            var self = this;

            this.model.destroy({success: function(model, response){
                self.el.remove();
            }});
        }
    });
});
