class AddDbAddressToPouchKeys < ActiveRecord::Migration
  def change
    add_column :pouch_keys, :db_address, :string
  end
end
