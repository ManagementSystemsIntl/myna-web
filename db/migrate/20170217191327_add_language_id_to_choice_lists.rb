class AddLanguageIdToChoiceLists < ActiveRecord::Migration
  def change
    add_column :choice_lists, :language_id, :integer
  end
end
