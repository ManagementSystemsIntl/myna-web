class RemoveUnusedFields < ActiveRecord::Migration
  def change
    remove_column :questions, :schema_json
    remove_column :questions, :form_json
    remove_column :sections, :display_name
    remove_column :sections, :json_schema
    remove_column :sections, :last_updated
    remove_column :sections, :last_published
    remove_column :surveys, :json_schema
    remove_column :surveys, :last_published
    remove_column :surveys, :pouch_id
  end
end
