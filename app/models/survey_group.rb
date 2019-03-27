class SurveyGroup < ActiveRecord::Base
  require 'net/http'
  validates :name, presence: true

  attr_encrypted :couch_pwd, key: Rails.application.secrets.couch_encryption_key
  has_many :devices
  has_many :surveys, dependent: :destroy
  has_many :survey_families, dependent: :destroy
  has_many :choice_lists, dependent: :destroy
  has_one :pouch_key, dependent: :destroy

  default_scope { order(:id => :asc) }

  def create_couch_dbs
    surveydb = self.create_db("schemas")
    responsedb = self.create_db("responses")
    if ['201', '202', '412'].include?(surveydb.code) && ['201', '202', '412'].include?(responsedb.code)
      # if successful, make a new user in couch
      user_creds = {:username => SecureRandom.hex(16), :password => SecureRandom.hex(32)}
      user = self.create_user(user_creds)
      # if you can't create a user (i.e. because youre using cloudant), use cloudant api key method
      if ['404'].include? user.code
        user = self.make_api_key()
        unless ['200','201','202'].include? user.code
          abort
        end
        key = JSON.parse(user.body)
        user_creds = {:username => key["key"], :password => key["password"]}
      end

      survey_permissions = self.get_existing_roles("schemas")
      response_permissions = self.get_existing_roles("responses")
      survey_permissions_updated = self.add_key_to_db("schemas", user_creds, survey_permissions.body, key || nil)
      response_permissions_updated = self.add_key_to_db("responses", user_creds, response_permissions.body, key || nil)

      pdbKey = self.save_pdb_key(user_creds)
    end
  end

  def setup_http
    uri = URI.parse("https://#{self.couch_domain}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    return http
  end

  def setup_req(action, url)
    req = action === "Put" ? Net::HTTP::Put.new(url) :
      action === "Post" ? Net::HTTP::Post.new(url) : Net::HTTP::Get.new(url)
    req.add_field("Content-Type","application/json")
    req.add_field("Accept","application/json")
    req.basic_auth self.couch_user, self.couch_pwd
    return req
  end

  def create_db(type)
    http = self.setup_http()
    req = self.setup_req('Put', "/#{self.db_name}_#{type}")
    res = http.request(req)
  end

  def create_user(user)
    http = self.setup_http()
    req = self.setup_req('Post', "/_users")
    req.body = create_new_user(user).to_json
    res = http.request(req)
  end

  def make_api_key()
    http = self.setup_http()
    req = self.setup_req('Post', "/_api/v2/api_keys")
    res = http.request(req)
  end

  def get_existing_roles(type)
    http = self.setup_http()
    req = self.setup_req('GET', "/#{self.db_name}_#{type}/_security")
    res = http.request(req)
  end

  def add_key_to_db(type, user_creds, existing_permissions, is_cloudant)
    http = self.setup_http()
    req = self.setup_req('Put', "/#{self.db_name}_#{type}/_security")
    req.body = append_permissions(user_creds, existing_permissions, is_cloudant).to_json
    res = http.request(req)
  end

  def save_pdb_key(user_creds)
    pdbKey = PouchKey.create(:survey_group => self, :username => user_creds[:username], :pwd => user_creds[:password], :db_name => self.db_name, :db_address => self.couch_domain)
  end


  def db_name
    ["egra", Rails.application.secrets.client, self.name].join("_").gsub(/[^\d\w_]/,"_").downcase
  end

  def create_new_user(user)
    {
      "_id": "org.couchdb.user:#{user[:username]}",
      "name": "#{user[:username]}",
      "type": "user",
      "roles": [],
      "password": "#{user[:password]}"
    }
  end

  def append_permissions(user, permissions, is_cloudant)
    perms = JSON.parse(permissions)
    if is_cloudant
      if perms["cloudant"].nil?
        perms["cloudant"] = {}
        perms["cloudant"][user[:username]] = ["_admin","_reader","_writer","_replicator"]
        perms["cloudant"]["nobody"] = []
        perms["_id"] = "_security"
      else
        permissions["cloudant"][user[:username]] = ["_admin","_reader","_writer","_replicator"]
      end
    else
      perms["admins"] = {}
      perms["admins"]["names"] = [self.couch_user, user[:username]]
      perms["members"] = {}
      perms["members"]["names"] = [self.couch_user, user[:username]]
    end
    return perms
  end
end
