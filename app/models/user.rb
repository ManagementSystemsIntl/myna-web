class User < ActiveRecord::Base
  rolify
  resourcify
  after_create :add_user_role

  has_and_belongs_to_many :roles, :join_table => :users_roles
  has_and_belongs_to_many :projects 

  validates_uniqueness_of :email
  ## email must be from some domain (usaid.gov or msi-inc.com)
  # validates :email, format: { with: /\b[A-Z0-9._%a-z\-]+@msi-inc\.com\z/,
  #                 message: "email domain must be msi-inc.com" }

  # Include default devise modules. Others available are:
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable

  def add_role(role_symbol)
    UsersRole.add_role self,role_symbol
  end

  def delete_role(role_symbol)
    UsersRole.delete_role self,role_symbol
  end

  def add_user_role
    UsersRole.add_role self,:user
  end

  def default_project
    if data != nil && data["last_project"] != nil
      return data["last_project"]
    end
    p = get_default_project
  end

  def project_list
    if self.role? :admin
      Project.all
    else 
      self.projects
    end
  end

  def allow_project?(project_id)
    project_list.ids.map.include? project_id
  end

  def set_last_project(project_id)
    data[:last_project] = project_id
    save
  end

  def role?(role)  
    roles.any? { |r| r.name.underscore.to_sym == role }  
  end  

  private

  def get_default_project
    if self.role? :admin
      Project.first.id
    else 
      self.projects.first.id if self.projects.length > 0
    end
  end

end
