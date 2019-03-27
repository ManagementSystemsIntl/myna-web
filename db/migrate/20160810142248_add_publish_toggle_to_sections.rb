class AddPublishToggleToSections < ActiveRecord::Migration
  def change
    add_column :sections, :is_publishable, :boolean, default: false
  end
end
