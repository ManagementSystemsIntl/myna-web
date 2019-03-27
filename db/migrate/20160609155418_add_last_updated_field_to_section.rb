class AddLastUpdatedFieldToSection < ActiveRecord::Migration
  def change
    add_column :sections, :last_updated, :timestamp
  end
end
