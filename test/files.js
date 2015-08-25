var assert = chai.assert,
    expect = chai.expect,
    should = chai.should(); // Note that should has to be executed

var File = window.models.File;
var root,d,f;
describe('base', function(){
    before(function(done){
        root = new File({isDir: true});
        d = new File({name: 'd', isDir: true},root);
        f= new File({name: 'f'},d);

        done();
    })
    it('fullpath', function() {
        expect(f._fullPath).to.equal(undefined);
        f.fullpath().should.equal('/d/f');
        d.fullpath().should.equal('/d/');
        root.fullpath().should.equal('/');
    })
    it('assert set', function() {
        f.set({parent:root, name: 'f_new'}).fullpath().should.equal('/f_new');
    })

});