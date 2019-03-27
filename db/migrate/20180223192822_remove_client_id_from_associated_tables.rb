class RemoveClientIdFromAssociatedTables < ActiveRecord::Migration
  def change
    remove_column :pouch_keys, :client_id 
    remove_column :survey_groups, :client_id
    remove_column :surveys, :client_id
  end
end
