class AddActiveToFamilies < ActiveRecord::Migration
  def change
    add_column :survey_families, :is_active, :boolean
  end
end
