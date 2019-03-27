json.array!(@schemas) do |schema|
  json.extract! schema, :id, :json_schema, :iteration, :pouch_id, :publishing_id, :publishing_type
  json.url schema_url(schema, format: :json)
end
