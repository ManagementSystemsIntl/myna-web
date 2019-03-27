class AddActivationKeyToPouchKeys < ActiveRecord::Migration
  def change
    add_column :pouch_keys, :external_key, :string
  end
end
