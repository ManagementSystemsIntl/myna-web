class AddDirectionalityToLanguages < ActiveRecord::Migration
  def change
    add_column :languages, :direction, :string
    add_column :languages, :default_language, :boolean
  end
end
