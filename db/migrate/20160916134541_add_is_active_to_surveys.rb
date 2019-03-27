class AddIsActiveToSurveys < ActiveRecord::Migration
  def change
    add_column :surveys, :is_active, :boolean
  end
end
