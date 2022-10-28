json.extract! @survey_group, :id, :name, :created_at, :updated_at, :school_count
if @survey_group.pouch_key
  json.pouch_key do
    json.extract! @survey_group.pouch_key, :id, :username, :pwd, :db_name, :db_address
  end
end
# if @create
#   json.messages do
#     if @schema_db
#       json.db do
#         json.extract! @schema_db, :message, :code
#         json.body JSON.parse(@schema_db.body)
#       end
#     end
#     if @response_db
#       json.db do
#         json.extract! @response_db, :message, :code
#         json.body JSON.parse(@response_db.body)
#       end
#     end
#     if @key
#       json.key do
#         json.extract! @key, :message, :code
#         json.body JSON.parse(@key.body)
#       end
#     end
#     if @schema_permissions
#       json.permissions do
#         json.extract! @schema_permissions, :message, :code
#         json.body JSON.parse(@schema_permissions.body)
#       end
#     end
#     if @response_permissions
#       json.permissions do
#         json.extract! @response_permissions, :message, :code
#         json.body JSON.parse(@response_permissions.body)
#       end
#     end
#   end
# end
