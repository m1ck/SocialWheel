from django.http import HttpResponse
from django.template import Context, loader
import simplejson
from BeautifulSoup import BeautifulSoup

import urllib2
import urllib

from google.appengine.api import urlfetch



siteurl = {'twitter': 'http://twitter.com/', 'flickr': 'http://www.flickr.com/photos/' , 'digg': 'http://digg.com/users/'}
sitelen = {'twitter': 19, 'flickr': 29, 'digg': 22}

siteid='twitter'



def showwheel(request, site=None):
        id = request['id']
        friend_l = getContacts(id,site)
	t = loader.get_template('showwheel.html')
	c = Context({'id': id, 'friends':  simplejson.JSONEncoder().encode(friend_l), 'flen' :len(friend_l), 'site' :site , 'siteurl': siteurl[site] })
	return HttpResponse(t.render(c))




def getfriends(request):     
	id = request['id']
        site = request['site']
        friend_list = []
	
	query = urllib.urlencode({'q' : siteurl[site]+id})
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
		        if site == 'digg' or site == 'flickr':
			   friend_list.append(friend[sitelen[site]:].rstrip('/'))
                        else:
			   friend_list.append(friend[sitelen[site]:])
        trm = ({"success": 'true', "contacts": friend_list})
	return HttpResponse('('+simplejson.JSONEncoder().encode(trm)+')' , mimetype='application/javascript')


def numfriends(request):     
	id = request['id']
        site = request['site']
        friend_list = []
	f = 0
	query = urllib.urlencode({'q' : siteurl[site]+id})
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
		       f = f+1
        trm = ({"success": 'true', "contacts": f})
	return HttpResponse('('+simplejson.JSONEncoder().encode(trm)+')' , mimetype='application/javascript')




def getContacts(id,site):
        friend_list = []
	query = urllib.urlencode({'q' : siteurl[site]+id})
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
		        if site == 'digg' or site == 'flickr':
			   friend_list.append(friend[sitelen[site]:].rstrip('/'))
                        else:
			   friend_list.append(friend[sitelen[site]:])
	return friend_list

def main(request, template_name):
	if(request.has_key('id')):
	   id = request['id']
	   site = request['site']
	   friend_l = getContacts(id,site)
	   t = loader.get_template('showwheel.html')
	   c = Context({'id': id, 'friends':  simplejson.JSONEncoder().encode(friend_l), 'flen' :len(friend_l), 'site' :site , 'siteurl': siteurl[site] })
	   return HttpResponse(t.render(c))
      
        else:

	  t = loader.get_template(template_name)
	  c = Context({'wheel':  "a" , })
	  return HttpResponse(t.render(c))


def network(request, template_name):
	if(request.has_key('site')):	   
	   site = request['site']
	   template_name= site+'_network.html'
	   t = loader.get_template(template_name)
	   c = Context({'wheel':  "a" , })
	   return HttpResponse(t.render(c))
      
        else:

	  t = loader.get_template(template_name)
	  c = Context({'wheel':  "a" , })
	  return HttpResponse(t.render(c))

