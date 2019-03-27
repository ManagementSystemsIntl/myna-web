class CreateTranslations < ActiveRecord::Migration
  def change
    create_table :translations do |t|
      t.integer :language_id
      t.integer :question_attribute_id
      t.string :value

      t.timestamps null: false
    end
  end
end
