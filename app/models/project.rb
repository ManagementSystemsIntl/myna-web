class Project < ActiveRecord::Base
    has_many :survey_groups, dependent: :destroy
    has_and_belongs_to_many :users 

    validates_presence_of :name

    def self.to_option_values
      objects = self.order(:name)
      values = Hash.new
      
      objects.each do |o|
        values[o.name] = o.id
      end
      return values
    end
end
