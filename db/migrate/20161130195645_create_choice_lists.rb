class CreateChoiceLists < ActiveRecord::Migration
  def change
    create_table :choice_lists do |t|
      t.string :name
      t.integer :survey_group_id
      
      t.timestamps null: false
    end
  end
end
