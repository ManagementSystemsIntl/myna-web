class AddUniqueConstraintToProjectsUsers < ActiveRecord::Migration
  def change
    add_index :projects_users, [:project_id, :user_id], unique: true, name: "projects_users_unique_index"
  end
end
