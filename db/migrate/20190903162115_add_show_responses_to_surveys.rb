class AddShowResponsesToSurveys < ActiveRecord::Migration
  def change
    add_column :surveys, :show_responses, :boolean, :default => false
  end
end
