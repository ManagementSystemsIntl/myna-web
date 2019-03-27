class AddGradeToSections < ActiveRecord::Migration
  def change
    add_column :sections, :grade, :string
  end
end
