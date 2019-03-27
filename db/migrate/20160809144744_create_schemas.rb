class CreateSchemas < ActiveRecord::Migration
  def change
    create_table :schemas do |t|
      t.belongs_to :survey
      t.string :json_schema
      t.integer :iteration
      t.string :pouch_id

      t.timestamps null: false
    end
  end
end
