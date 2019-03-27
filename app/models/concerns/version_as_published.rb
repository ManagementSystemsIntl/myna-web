module VersionAsPublished
  extend ActiveSupport::Concern

  def version_as_published
    self.paper_trail_event = "publish"
    self.paper_trail.touch_with_version
    self.paper_trail_event = nil
    # the code below wipes out versions up to last published
    # last_pub = self.versions.where(event:"publish").last
    # self.versions.where("created_at < ?",last_pub.created_at).delete_all
  end

end
