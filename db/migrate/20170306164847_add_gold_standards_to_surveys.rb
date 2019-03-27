class AddGoldStandardsToSurveys < ActiveRecord::Migration
  def change
    add_column :surveys, :gold_standards, :string
  end
end
