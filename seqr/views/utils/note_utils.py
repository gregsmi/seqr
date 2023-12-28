import json

from seqr.views.utils.json_to_orm_utils import update_model_from_json, create_model_from_json
from seqr.views.utils.json_utils import create_json_response, _to_snake_case
from seqr.views.utils.permissions_utils import check_user_created_object_permissions

def create_note_handler(request, model_cls, get_response_json, 
                        required_fields, optional_fields=None, **kwargs):
    """Create a note model.
    
    Args:
        request: Django request object.
        model_cls: Note model class.
        get_response_json: Function that returns the proper note object dictionary for response.
        required_fields: List of fields required to be in the request body.
        optional_fields: Optional list of optional fields.
        **kwargs: Optional additional field value pairs to set on the new model object.
    """
    request_json = json.loads(request.body)

    if missing_fields := [field for field in required_fields if not request_json.get(field)]:
        error = 'Missing required field(s): {}'.format(', '.join(missing_fields))
        return create_json_response({'error': error}, status=400, reason=error)

    note_fields = required_fields + (optional_fields or [])
    create_json = {_to_snake_case(k): request_json[k] for k in note_fields if k in request_json}
    create_json.update(kwargs)
    note = create_model_from_json(model_cls, create_json, request.user)

    return create_json_response(get_response_json(note))


def update_note_handler(request, model_cls, note_guid, get_response_json, **kwargs):
    """Update a note model.
    
    Args:
        request: Django request object.
        model_cls: Note model class.
        note_guid: Note guid for the specific note to update.
        get_response_json: Function that returns the proper note object dictionary for response.
        **kwargs: Optional additional field value pairs to restrict the search for the model object.    
    
    """
    note = model_cls.objects.get(guid=note_guid, **kwargs)
    check_user_created_object_permissions(note, request.user)

    request_json = json.loads(request.body)
    update_model_from_json(note, request_json, user=request.user, allow_unknown_keys=True)

    return create_json_response(get_response_json(note))


def delete_note_handler(request, model_cls, note_guid, get_response_json, **kwargs):
    """Delete a note model.
    
    Args:
        request: Django request object.
        model_cls: Note model class.
        note_guid: Note guid for the specific note to delete.
        get_response_json: Function that returns the proper note object dictionary for response.
        **kwargs: Optional additional field value pairs to restrict the search for the model object.    
    
    """
    note = model_cls.objects.get(guid=note_guid, **kwargs)
    note.delete_model(request.user)
    return create_json_response(get_response_json())
