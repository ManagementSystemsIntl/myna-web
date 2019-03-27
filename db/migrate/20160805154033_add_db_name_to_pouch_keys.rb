class AddDbNameToPouchKeys < ActiveRecord::Migration
  def change
    add_column :pouch_keys, :db_name, :string
  end
end
