class Client < ActiveRecord::Base
  validates :name, presence: true

  has_many :survey_groups, dependent: :destroy
  has_many :surveys, dependent: :destroy
  has_many :pouch_keys, dependent: :destroy
end
