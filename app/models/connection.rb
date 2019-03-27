class Connection < ActiveRecord::Base
  belongs_to :device
  belongs_to :survey_group
end
