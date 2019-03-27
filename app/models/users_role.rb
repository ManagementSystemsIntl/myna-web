class UsersRole < ActiveRecord::Base
  belongs_to :user 
  belongs_to :role

  def self.add_role(subject,role_symbol)
    role_row = Role.find_or_create_by(name:role_symbol.to_s)
    role_id = role_row.id
    self.find_or_create_by(user_id: subject.id, role_id: role_id)
  end

  def self.delete_role(subject,role_symbol)
    role_row = subject.roles.find_by(name:role_symbol.to_s)
    if  role_row.nil?
      raise "cannot delete nonexisting role on subject"
    end
    role_id = role_row.id
    self.delete_all(user_id: subject.id,role_id: role_id)
  end

  private_class_method :new
end
