class CreatePouchKeys < ActiveRecord::Migration
  def change
    create_table :pouch_keys do |t|
      t.belongs_to :survey_group
      t.belongs_to :client
      t.string :username
      t.string :pwd
      t.timestamps null: false
    end
  end
end
