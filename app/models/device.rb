class Device < ActiveRecord::Base
  belongs_to :survey_group
  has_many :connections
end
