class CreateProjects < ActiveRecord::Migration
  def change
    create_table :projects do |t|
      t.string   :name,   null: false
      t.timestamps null: false
    end

    create_join_table :projects, :users do |t|
      t.index [:project_id, :user_id]
      t.index [:user_id, :project_id]
    end

    add_reference :survey_groups, :project, null: true, foreign_key: true
  end
end
