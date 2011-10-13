from google.appengine.ext import db
from google.appengine.ext import search 


class MonthlyTrends(db.Model):
    name = db.StringProperty()
    trends = db.TextProperty()
    month = db.DateProperty()
    added_on = db.DateTimeProperty(auto_now_add=True)


class trends(search.SearchableModel):
    term = db.StringProperty()
    date = db.DateProperty()
