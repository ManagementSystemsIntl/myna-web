class AddPublishingTypeAndPublishingIdToSchemas < ActiveRecord::Migration
  def change
    add_column :schemas, :publishing_id, :integer
    add_column :schemas, :publishing_type, :string

    add_index :schemas, [:publishing_id, :publishing_type]
  end
end
