class AddFKsAndUniqConstraints < ActiveRecord::Migration
  def change
    change_column :users, :email, :string, unique: true, null: false

    add_foreign_key :surveys, :survey_groups, on_delete: :cascade
    add_index :surveys, [:uuid], unique: true

    add_foreign_key :survey_families, :survey_groups, on_delete: :cascade
    add_index :survey_families, [:uuid], unique: true

    add_foreign_key :survey_family_joins, :surveys, on_delete: :cascade
    add_foreign_key :survey_family_joins, :survey_families, on_delete: :cascade
    add_index :survey_family_joins, [:survey_id, :survey_family_id], unique: true

    add_foreign_key :languages, :survey_groups, on_delete: :cascade
    add_index :languages, [:name, :survey_group_id], unique: true

    add_foreign_key :survey_languages, :surveys, on_delete: :cascade
    add_foreign_key :survey_languages, :languages, on_delete: :cascade
    add_index :survey_languages, [:survey_id, :language_id], unique: true
    
    add_foreign_key :pouch_keys, :survey_groups, on_delete: :cascade

    add_foreign_key :choice_lists, :survey_groups, on_delete: :cascade
    add_foreign_key :choice_lists, :languages, on_delete: :cascade

    add_foreign_key :devices, :survey_groups, on_delete: :nullify
    add_index :devices, [:uuid], unique: true

    add_foreign_key :connections, :survey_groups
    add_foreign_key :connections, :devices, on_delete: :cascade

    add_foreign_key :sections, :surveys, on_delete: :cascade

    add_foreign_key :question_types, :question_categories, on_delete: :cascade

    add_foreign_key :question_type_options, :question_types, on_delete: :cascade
    add_foreign_key :question_type_options, :question_options, on_delete: :cascade
    add_index :question_type_options, [:question_type_id, :question_option_id], unique: true, name: "index_question_type_options_on_q_type_id_and_q_option_id"


    add_foreign_key :questions, :question_types, on_delete: :nullify # should this cascade?
    add_foreign_key :questions, :sections, on_delete: :cascade
    add_foreign_key :questions, :surveys, on_delete: :cascade
    add_foreign_key :questions, :choice_lists, on_delete: :nullify

    add_foreign_key :question_attributes, :question_options, on_delete: :cascade
    add_foreign_key :question_attributes, :questions, on_delete: :cascade # ok if question_id is nullable?
    add_foreign_key :question_attributes, :choice_lists, on_delete: :cascade # ok if choice_list_id is nullable?
    # not adding a check constraint here, but seems a record must have EITHER a question_id OR a choice_list_id
    # would be nice to have unique constraints on [question_option_id, question_id] and [question_option_id, choice_list_id] but data has many entries with null coded_value values that are being treated as distinct. maybe add later.

    add_foreign_key :translations, :question_attributes, on_delete: :cascade
    add_foreign_key :translations, :languages, on_delete: :cascade
    add_index :translations, [:question_attribute_id, :language_id], unique: true
  end
end
