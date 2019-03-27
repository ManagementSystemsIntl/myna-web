class AddHintsToSections < ActiveRecord::Migration
  def change
    add_column :sections, :hint, :text
  end
end
