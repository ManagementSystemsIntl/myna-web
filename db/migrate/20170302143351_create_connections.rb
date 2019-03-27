class CreateConnections < ActiveRecord::Migration
  def change
    create_table :connections do |t|

      t.integer :device_id
      t.integer :survey_group_id
      t.boolean :active, default: true

      t.timestamps null: false
    end
  end
end
