import re
from google.appengine.ext import webapp
import simplejson
import urllib
from google.appengine.api import urlfetch

 
register = webapp.template.create_template_register()
 
def escapeimg(body):
	return re.sub(r'&lt;img (.*)/&gt;', '[IMG]', body)
 
register.filter(escapeimg)



def getContacts(uid):       
	friend_list = []
	query = urllib.urlencode({'q' : 'http://twitter.com/'+uid})
	url = 'http://socialgraph.apis.google.com/lookup?me=1&edo=1&edi=1&%s' % (query)
	search_results = urlfetch.fetch(url)
	json = simplejson.loads(search_results.content)
	results = json['nodes']
	for i in results:
	  info = results[i]
	  friends = info["nodes_referenced"]
	  for friend in friends:
		types = friends[friend]["types"]
		if types[0] == "contact":
			friend_list.append(friend[19:])
	return friend_list



@register.filter
def hasher(h, key):
    for e, r in h.iteritems():
		return e

@register.filter
def num(h, key):
    return key[0]
		


@register.filter
def trend(h, key):
    for k, v in h.iteritems():
		return v



@register.filter
def utitle(h, key):
    for k, v in h.iteritems():
		return k.upper()


@register.filter
def encode(h):    
		return h.replace(' ','+')
		
		
@register.filter
def flsit(h):    
   friend_l = getContacts(h)
   return friend_l

