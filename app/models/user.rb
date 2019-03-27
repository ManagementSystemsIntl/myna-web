class User < ActiveRecord::Base
  rolify
  resourcify
  after_create :add_user_role

  has_and_belongs_to_many :roles, :join_table => :users_roles

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

end
