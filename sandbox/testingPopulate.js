var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/sandbox", () =>{
    console.log('Connecting to *sandbox*');
});
var Schema = mongoose.Schema;

var personSchema = Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    age: Number,
    stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
});

var storySchema = Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Person' },
    title: String,
    fans: [{ type: Schema.Types.ObjectId, ref: 'Person' }]
});

var Story = mongoose.model('Story', storySchema);
var Person = mongoose.model('Person', personSchema);

var author = new Person({
    _id: new mongoose.Types.ObjectId(),
    name: 'Ian Fleming',
    age: 50
});

author.save(function (err, newAuthor) {
    if (err) return handleError(err)
    else {
        console.log('new author saved', newAuthor);
    }

    var story1 = new Story({
        title: 'Casino Royale',
        author: author._id    // assign the _id from the person
    });

    story1.save(function (err, doc) {
        if (err) return handleError(err);
        else {
            console.log('new story saved', doc);

            Story.
                findOne({ title: 'Casino Royale' })
                .populate('author')
                .then(story => {
                    console.log('***INFO of story with TITLE: Casino Royale**');
                    console.log(story);
                })
                .catch(err => {
                    console.log('ERR', err);
                })
        }
        // thats it!
    });
});
