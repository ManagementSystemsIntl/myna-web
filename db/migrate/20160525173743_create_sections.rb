class CreateSections < ActiveRecord::Migration
  def change
    create_table :sections do |t|
      t.integer :survey_id
      t.string :name
      t.string :display_name
      t.string :code
      t.string :json_schema
      t.integer :order
      t.integer :timer_value
      t.boolean :skippable
      t.integer :autostop
      t.timestamp :last_published

      t.timestamps null: false
    end
  end
end
