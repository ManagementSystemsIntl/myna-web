class AddIdentifierFieldToSurveys < ActiveRecord::Migration
  def change
    add_column :surveys, :uuid, :string
    add_column :surveys, :clone, :boolean, :default=> false
    add_column :surveys, :version, :boolean, :default=>false
    add_column :surveys, :version_number, :integer
    add_column :surveys, :version_of, :integer
    add_column :surveys, :cloned_from, :string
    add_column :surveys, :pouch_id, :string
  end
end
