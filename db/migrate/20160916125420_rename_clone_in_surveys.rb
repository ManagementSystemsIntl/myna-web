class RenameCloneInSurveys < ActiveRecord::Migration
  def change
    rename_column :surveys, :clone, :is_clone
  end
end
