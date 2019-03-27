class RemoveDefaultLanguageFromLanguages < ActiveRecord::Migration
  def change
    remove_column :languages, :default_language, :boolean
  end
end
