define([ 'gizmo/superdesk', config.guiJs('superdesk/user', 'models/person-meta') ],
function(Gizmo, PersonMeta)
{
    // Person (1-1 User)
    return Gizmo.Model.extend
    ({ 
        url: Gizmo.Url('/Person'),
        defaults: { MetaData: PersonMeta }
    });
});