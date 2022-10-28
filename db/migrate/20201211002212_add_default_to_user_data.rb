class AddDefaultToUserData < ActiveRecord::Migration
  def change
    change_column :users, :data, :jsonb, :null => false, :default => {}
  end
end
