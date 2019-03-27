class RemoveSchemaTemplatesFromQuestionTypes < ActiveRecord::Migration
  def change
    remove_column :question_types, :schema_json
    remove_column :question_types, :form_json
  end
end
