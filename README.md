ext-imageannotation
===================

A web-based tool for image annotation. It is an extension of svg-edit,
a                      general-purpose                      SVG-Editor
(https://code.google.com/p/svg-edit/).   Its   main   application   is
versatile  and   efficient  linking  of   manuscript  facsimiles  with
transcribed text.

Quick start
===========

To see an  example of an annotated image in the  editor, go to
<http://faustedition.github.io/ext-imageannotation> or copy the root
directory onto a webserver and open `ext-imageannotation-example.html`.

Usage
=====
The workflow is optimized for lines of text, but the editor is versatile
and can in principle be used with many types of shapes and text segments 
such as words, sentences, paragraphs, etc.

1. Select the rectangle tool on the left
2. Draw a rectangle around a block of text
3. Adjust the rectangle rotation and size
4. Select the 'Create lines' tool on the left
5. Click on the base line of a line of text. A line box is created.
6. Adjust the line box's height. All subsequently created line boxes will have the same height.
7. Create the rest of the line boxes
8. Delete the auxiliary rectangle
9. Mark a line of text on the right side and a line box, respectively, and press the 'Link' button to link them.

There is also an 'Automatic linking' option to link each newly created line
box with the next unlinked text line. Text can also be linked to any other SVG shape
created in the editor.
