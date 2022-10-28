# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20201211002212) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "choice_lists", force: :cascade do |t|
    t.string   "name"
    t.integer  "survey_group_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.integer  "language_id"
  end

  create_table "connections", force: :cascade do |t|
    t.integer  "device_id"
    t.integer  "survey_group_id"
    t.boolean  "active",          default: true
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
  end

  create_table "devices", force: :cascade do |t|
    t.string   "serial_number"
    t.string   "cordova"
    t.string   "model"
    t.string   "platform"
    t.string   "uuid"
    t.string   "version"
    t.string   "app_version"
    t.integer  "survey_group_id"
    t.string   "external_code"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  add_index "devices", ["uuid"], name: "index_devices_on_uuid", unique: true, using: :btree

  create_table "languages", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.string   "direction"
    t.integer  "survey_group_id"
  end

  add_index "languages", ["name", "survey_group_id"], name: "index_languages_on_name_and_survey_group_id", unique: true, using: :btree

  create_table "pouch_keys", force: :cascade do |t|
    t.integer  "survey_group_id"
    t.string   "username"
    t.string   "pwd"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.string   "db_name"
    t.string   "external_key"
    t.string   "db_address"
  end

  create_table "projects", force: :cascade do |t|
    t.string   "name",       null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "projects_users", id: false, force: :cascade do |t|
    t.integer "project_id", null: false
    t.integer "user_id",    null: false
  end

  add_index "projects_users", ["project_id", "user_id"], name: "index_projects_users_on_project_id_and_user_id", using: :btree
  add_index "projects_users", ["project_id", "user_id"], name: "projects_users_unique_index", unique: true, using: :btree
  add_index "projects_users", ["user_id", "project_id"], name: "index_projects_users_on_user_id_and_project_id", using: :btree

  create_table "question_attributes", force: :cascade do |t|
    t.integer  "question_option_id"
    t.string   "name"
    t.string   "value"
    t.integer  "question_id"
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
    t.string   "coded_value"
    t.integer  "order"
    t.integer  "choice_list_id"
  end

  create_table "question_categories", force: :cascade do |t|
    t.string   "name"
    t.string   "descriptive"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "question_options", force: :cascade do |t|
    t.string   "name"
    t.string   "option_type"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
    t.boolean  "translatable"
  end

  create_table "question_type_options", force: :cascade do |t|
    t.integer  "question_type_id"
    t.integer  "question_option_id"
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
  end

  add_index "question_type_options", ["question_type_id", "question_option_id"], name: "index_question_type_options_on_q_type_id_and_q_option_id", unique: true, using: :btree

  create_table "question_types", force: :cascade do |t|
    t.string   "name"
    t.string   "descriptive"
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
    t.boolean  "has_number"
    t.integer  "question_category_id"
  end

  create_table "questions", force: :cascade do |t|
    t.integer  "order"
    t.integer  "question_type_id"
    t.integer  "section_id"
    t.integer  "survey_id"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
    t.integer  "question_number"
    t.integer  "choice_list_id"
  end

  create_table "roles", force: :cascade do |t|
    t.string   "name"
    t.integer  "resource_id"
    t.string   "resource_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "roles", ["name", "resource_type", "resource_id"], name: "index_roles_on_name_and_resource_type_and_resource_id", using: :btree
  add_index "roles", ["name"], name: "index_roles_on_name", using: :btree

  create_table "schemas", force: :cascade do |t|
    t.string   "json_schema"
    t.integer  "iteration"
    t.string   "pouch_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.integer  "publishing_id"
    t.string   "publishing_type"
  end

  add_index "schemas", ["publishing_id", "publishing_type"], name: "index_schemas_on_publishing_id_and_publishing_type", using: :btree

  create_table "sections", force: :cascade do |t|
    t.integer  "survey_id"
    t.string   "name"
    t.string   "code"
    t.integer  "order"
    t.integer  "timer_value"
    t.boolean  "skippable"
    t.integer  "autostop"
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.boolean  "is_publishable", default: false
    t.string   "grade"
    t.text     "hint"
  end

  create_table "survey_families", force: :cascade do |t|
    t.string   "name"
    t.integer  "survey_group_id"
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.string   "uuid"
    t.boolean  "is_active"
    t.string   "gold_standards"
    t.boolean  "show_responses",  default: false
  end

  add_index "survey_families", ["uuid"], name: "index_survey_families_on_uuid", unique: true, using: :btree

  create_table "survey_family_joins", force: :cascade do |t|
    t.integer  "survey_family_id"
    t.integer  "survey_id"
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
    t.boolean  "is_random",        default: false
    t.integer  "order"
  end

  add_index "survey_family_joins", ["survey_id", "survey_family_id"], name: "index_survey_family_joins_on_survey_id_and_survey_family_id", unique: true, using: :btree

  create_table "survey_groups", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.string   "encrypted_couch_pwd"
    t.string   "encrypted_couch_pwd_iv"
    t.string   "couch_domain"
    t.string   "couch_user"
    t.integer  "school_count"
    t.integer  "project_id"
  end

  create_table "survey_languages", force: :cascade do |t|
    t.integer  "survey_id"
    t.integer  "language_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "survey_languages", ["survey_id", "language_id"], name: "index_survey_languages_on_survey_id_and_language_id", unique: true, using: :btree

  create_table "survey_targets", force: :cascade do |t|
    t.integer  "value"
    t.integer  "targetable_id"
    t.string   "targetable_type"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.integer  "irr_value"
  end

  add_index "survey_targets", ["targetable_type", "targetable_id"], name: "index_survey_targets_on_targetable_type_and_targetable_id", using: :btree

  create_table "surveys", force: :cascade do |t|
    t.string   "survey_type"
    t.string   "name"
    t.string   "grade"
    t.integer  "survey_group_id"
    t.datetime "created_at",                           null: false
    t.datetime "updated_at",                           null: false
    t.string   "uuid"
    t.boolean  "is_clone",             default: false
    t.boolean  "version",              default: false
    t.integer  "version_number"
    t.integer  "version_of"
    t.string   "cloned_from"
    t.integer  "missing_translations"
    t.boolean  "is_active"
    t.string   "gold_standards"
    t.boolean  "show_responses",       default: false
  end

  add_index "surveys", ["uuid"], name: "index_surveys_on_uuid", unique: true, using: :btree

  create_table "translations", force: :cascade do |t|
    t.integer  "language_id"
    t.integer  "question_attribute_id"
    t.string   "value"
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
  end

  add_index "translations", ["question_attribute_id", "language_id"], name: "index_translations_on_question_attribute_id_and_language_id", unique: true, using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.jsonb    "data",                   default: {}, null: false
  end

  add_index "users", ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true, using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "users_roles", id: false, force: :cascade do |t|
    t.integer "user_id"
    t.integer "role_id"
  end

  add_index "users_roles", ["user_id", "role_id"], name: "index_users_roles_on_user_id_and_role_id", using: :btree

  create_table "versions", force: :cascade do |t|
    t.string   "item_type",  null: false
    t.integer  "item_id",    null: false
    t.string   "event",      null: false
    t.string   "whodunnit"
    t.text     "object"
    t.datetime "created_at"
  end

  add_index "versions", ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id", using: :btree

  add_foreign_key "choice_lists", "languages", on_delete: :cascade
  add_foreign_key "choice_lists", "survey_groups", on_delete: :cascade
  add_foreign_key "connections", "devices", on_delete: :cascade
  add_foreign_key "connections", "survey_groups"
  add_foreign_key "devices", "survey_groups", on_delete: :nullify
  add_foreign_key "languages", "survey_groups", on_delete: :cascade
  add_foreign_key "pouch_keys", "survey_groups", on_delete: :cascade
  add_foreign_key "question_attributes", "choice_lists", on_delete: :cascade
  add_foreign_key "question_attributes", "question_options", on_delete: :cascade
  add_foreign_key "question_attributes", "questions", on_delete: :cascade
  add_foreign_key "question_type_options", "question_options", on_delete: :cascade
  add_foreign_key "question_type_options", "question_types", on_delete: :cascade
  add_foreign_key "question_types", "question_categories", on_delete: :cascade
  add_foreign_key "questions", "choice_lists", on_delete: :nullify
  add_foreign_key "questions", "question_types", on_delete: :nullify
  add_foreign_key "questions", "sections", on_delete: :cascade
  add_foreign_key "questions", "surveys", on_delete: :cascade
  add_foreign_key "sections", "surveys", on_delete: :cascade
  add_foreign_key "survey_families", "survey_groups", on_delete: :cascade
  add_foreign_key "survey_family_joins", "survey_families", on_delete: :cascade
  add_foreign_key "survey_family_joins", "surveys", on_delete: :cascade
  add_foreign_key "survey_groups", "projects"
  add_foreign_key "survey_languages", "languages", on_delete: :cascade
  add_foreign_key "survey_languages", "surveys", on_delete: :cascade
  add_foreign_key "surveys", "survey_groups", on_delete: :cascade
  add_foreign_key "translations", "languages", on_delete: :cascade
  add_foreign_key "translations", "question_attributes", on_delete: :cascade
end
