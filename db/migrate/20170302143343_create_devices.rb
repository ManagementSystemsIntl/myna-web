class CreateDevices < ActiveRecord::Migration
  def change
    create_table :devices do |t|

      t.string :serial_number
      t.string :cordova
      t.string :model
      t.string :platform
      t.string :uuid
      t.string :version
      t.string :app_version
      t.integer :survey_group_id
      t.string :external_code

      t.timestamps null: false
    end
  end
end
