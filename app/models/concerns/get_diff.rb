module GetDiff
  extend ActiveSupport::Concern

  def get_diff
    last_pub = self.versions.where(event:"publish").last
    if last_pub
      current = PaperTrail.serializer.dump(self.paper_trail.object_attrs_for_paper_trail)
      @diff = Differ.diff(current,last_pub.object)
      return @diff
    else
      return nil
    end
  end

end
