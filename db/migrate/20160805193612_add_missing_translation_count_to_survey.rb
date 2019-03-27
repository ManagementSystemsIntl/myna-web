class AddMissingTranslationCountToSurvey < ActiveRecord::Migration
  def change
    add_column :surveys, :missing_translations, :integer
  end
end
