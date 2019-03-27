json.extract! @schema, :id, :json_schema, :iteration, :pouch_id, :publishing_id, :publishing_type
json.published_at @schema.created_at.to_formatted_s(:long)
